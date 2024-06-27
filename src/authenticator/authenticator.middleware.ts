import { Injectable, NestMiddleware } from '@nestjs/common';

import { ISolvedChallenge } from 'src/types/authenticator';

import { ErrorType, ErrorStatusCode } from 'src/types/errors';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from '../schemas/challenge.schema';

import { verifyMessage } from 'viem';

@Injectable()
export class AuthenticatorMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Challenge.name) private readonly challengeModel: Model<Challenge>
  ) { }

  async use(req: any, res: any, next: () => void) {
    const { token }: { token: ISolvedChallenge } = req.body;

    if (!token || token === null || typeof token !== 'object' || token.constructor.name !== 'Object') res.status(200).send({
      error: ErrorType.Unauthorized,
      message: 'Missing or invalid token parameter.',
      statusCode: ErrorStatusCode.Unauthorized
    });

    const { address, signature, expiry } = token;

    // verify expiry to potentially save one db call
    if (expiry < Date.now()) return res.status(200).send({
      error: ErrorType.Unauthorized,
      message: 'Token expired.',
      statusCode: ErrorStatusCode.Unauthorized
    });

    const challenge = await this.challengeModel.findOne({
      address
    });

    if (!challenge) return res.status(200).send({
      error: ErrorType.Unauthorized,
      message: 'There is no issued token for your address.',
      statusCode: ErrorStatusCode.Unauthorized
    });

    const valid = await verifyMessage({
      message: `${challenge.challenge}:${challenge.expiry}`,
      signature,
      address
    });

    if (!valid) return res.status(200).send({
      error: ErrorType.Unauthorized,
      message: 'Invalid token.',
      statusCode: ErrorStatusCode.Unauthorized
    });

    next();
  }
}
