import { IResponse } from './response';

export interface IProject {
    owner: `0x${string}`;
    type: 'token' | 'nft';
    address: `0x${string}`;
    bookmarked?: boolean;
}

export interface IGetProjectsResponse extends IResponse {
    data?: {
        name: string;
        symbol: string;
        logo: string;
        price?: string;
        avgPrice?: string;
        floorPrice?: string;
        bookmarked?: boolean;
    }[];
}