import { Controller, Get, Query } from '@nestjs/common';

import { AuthenticatorService } from './authenticator.service';

import { IChallenge, IGetChallengeResponse } from 'src/types/authenticator';
import { ErrorType, ErrorStatusCode } from 'src/types/errors';

import {isAddress} from 'viem';

@Controller('authenticator')
export class AuthenticatorController {
    constructor(private readonly authenticatorService: AuthenticatorService) {}

    @Get('challenge')
    async getChallenge(@Query() query): Promise<IGetChallengeResponse> {
        const address = query.address;

        if (!address || !isAddress(address))
            return {
                error: ErrorType.BadRequest,
                message: 'Missing or invalid address parameter.',
                statusCode: ErrorStatusCode.BadRequest
            };

        const challenge: IChallenge = await this.authenticatorService.issue(address as `0x${string}`);

        return {
            data: challenge,
            message: 'Challenge issued.',
            statusCode: 200
        };
    }
}
