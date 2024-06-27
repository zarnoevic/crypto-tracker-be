import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
    @Prop({ required: true })
    owner: `0x${string}`;

    @Prop({ required: true })
    type: 'token' | 'nft';

    @Prop({ required: true })
    address: `0x${string}`;

    @Prop({ required: false })
    bookmarked: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);