import { IsString } from 'class-validator';

export class MemberModel {
  [key: string]: unknown; // Index signature for Record compatibility

  @IsString()
  name: string;

  role?: string;

  link?: string;

  bio?: string;

  image?: string | Buffer;
}

