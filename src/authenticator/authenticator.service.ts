import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from '../schemas/challenge.schema';

@Injectable()
export class AuthenticatorService {
    constructor(
        @InjectModel(Challenge.name) private readonly challengeModel: Model<Challenge>
    ) { }

    async issue(address: `${string}`): Promise<Challenge> {
        const challenge = `${Math.random()}.${Date.now()}`;
        const expiry = Date.now() + 24 * 60 * 60 * 1000;

        const existing = await this.challengeModel.findOne({ address });

        if (existing) {
            existing.challenge = challenge;
            existing.expiry = expiry;
            return existing.save();
        } else return await this.challengeModel.create({ address, challenge, expiry });
    }
}
