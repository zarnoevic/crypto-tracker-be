import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChallengeDocument = HydratedDocument<Challenge>;

@Schema()
export class Challenge {
    @Prop({ required: true })
    address: `0x${string}`;

    @Prop({ required: true })
    challenge: string;

    @Prop({ required: true })
    expiry: number;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);