import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { COLLECTIONS } from 'src/constants';

/**
 * Interface for user history data
 */
interface UserHistoryData {
  documentId: string;
  productData: Record<string, unknown>;
}

/**
 * Service for Firestore database operations
 */
@Injectable()
export class FirestoreService {
  private readonly historyCollection = COLLECTIONS.HISTORY;
  private readonly partnerCollection = COLLECTIONS.VERIFIED_PARTNER;
  private readonly userCollection = COLLECTIONS.USERS;
  private readonly productsCollection = COLLECTIONS.PRODUCTS;

  /**
   * Get history for a specific user
   */
  async getHistoryUser(user: string): Promise<UserHistoryData[] | string> {
    return this.getHistoryProduct(user, this.userCollection);
  }

  /**
   * Get history for a specific partner
   */
  async getHistoryPartner(partner: string): Promise<UserHistoryData[] | string> {
    return this.getHistoryProduct(partner, this.partnerCollection);
  }

  /**
   * Get history products for a given entity
   */
  private async getHistoryProduct(
    user: string,
    collection: string,
  ): Promise<UserHistoryData[] | string> {
    const docRef = admin
      .firestore()
      .collection(collection)
      .doc(user)
      .collection(this.historyCollection);

    try {
      const snapshot = await docRef.get();

      if (snapshot.empty) {
        return 'No documents found in the history collection for the user.';
      }

      const userHistoryData: UserHistoryData[] = [];

      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const historyData = doc.data();
          const productRef = historyData.product;

          if (productRef) {
            const productDoc = await productRef.get();

            if (productDoc.exists) {
              const productData = productDoc.data();
              userHistoryData.push({
                documentId: doc.id,
                productData,
              });
            }
          }
        }),
      );

      return userHistoryData;
    } catch (error) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  /**
   * Get all product references and resolve them
   */
  async getAllRefWithinProducts(): Promise<{ product: Record<string, unknown> }[]> {
    try {
      const querySnapshot = await admin
        .firestore()
        .collection(this.productsCollection)
        .get();

      const productsData: { product: Record<string, unknown> }[] = [];

      // Use Promise.all for parallel execution instead of sequential for loop
      const resolvedProducts = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const { productRef } = data;
          return this.resolveReference(productRef);
        }),
      );

      resolvedProducts.forEach((resolvedProductRef) => {
        productsData.push({
          product: resolvedProductRef,
        });
      });

      return productsData;
    } catch (error) {
      throw new Error(`Failed to retrieve data: ${error.message}`);
    }
  }

  /**
   * Resolve a Firestore document reference path to its data
   */
  async resolveReference(reference: string): Promise<Record<string, unknown>> {
    try {
      const referenceDoc = await admin.firestore().doc(reference).get();

      if (referenceDoc.exists) {
        return referenceDoc.data();
      }

      throw new Error(`Referenced document not found for path: ${reference}`);
    } catch (error) {
      throw new Error(`Failed to resolve reference: ${error.message}`);
    }
  }

  /**
   * Resolve multiple references in batch for better performance
   */
  async resolveReferences(references: string[]): Promise<Record<string, unknown>[]> {
    try {
      const resolvedData = await Promise.all(
        references.map((ref) => this.resolveReference(ref)),
      );
      return resolvedData;
    } catch (error) {
      throw new Error(`Failed to resolve references: ${error.message}`);
    }
  }
}

