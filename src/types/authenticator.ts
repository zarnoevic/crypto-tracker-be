import { IResponse } from './response';

export interface IChallenge {
    address: `0x${string}`;
    challenge: string;
    expiry: number;
}

export interface ISolvedChallenge extends IChallenge {
    signature: `0x${string}`;
}

export interface IGetChallengeResponse extends IResponse {
    data?: IChallenge;
}