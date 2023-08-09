import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  firsName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String, lowercase: true, required: true, unique: true })
  email: string;

  @Prop({ type: String, select: false })
  password: string;

  @Prop({
    type: String,
    enum: ['USER', 'ADMIN', 'DEVELOPER'],
    default: 'USER',
  })
  role: string;

  @Prop({ type: Number })
  phoneNumber: number;

  // location;
  @Prop({ type: [String] })
  scopes: [string];

  @Prop({ type: String })
  aboutMe: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
