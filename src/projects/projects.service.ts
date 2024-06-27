import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';

import Moralis from 'moralis';

import { ErrorStatusCode, ErrorType } from 'src/types/errors';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private readonly projectModel: Model<Project>,
        private configService: ConfigService
    ) {
        Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        });
    }

    async track({
        owner,
        address,
        type,
        bookmarked
    }: {
        owner: `0x${string}`,
        address: `0x${string}`,
        type: 'token' | 'nft',
        bookmarked?: boolean
    }): Promise<{
        error?: ErrorType,
        message?: string,
        statusCode?: ErrorStatusCode
    } | null> {
        const existing = await this.projectModel.findOne({
            owner,
            address,
        });

        if (!existing) {
            if (type === 'token') {
                try {
                    const response = await Moralis.EvmApi.token.getTokenMetadata({
                        chain: '0x1',
                        addresses: [
                            address
                        ]
                    });

                    const [token] = response.raw;

                    const { name, symbol } = token;

                    if (name === '' || symbol === '') return {
                        error: ErrorType.BadRequest,
                        message: 'Provided address is not a token or cannot be tracked.',
                        statusCode: ErrorStatusCode.BadRequest
                    };

                    await this.projectModel.create({
                        owner,
                        address,
                        type,
                        bookmarked
                    });

                    return null;
                } catch (e) {
                    return {
                        error: ErrorType.InternalServerError,
                        message: e.message,
                        statusCode: ErrorStatusCode.InternalServerError
                    };
                }
            } else if (type === 'nft') {
                const response = await Moralis.EvmApi.nft.getNFTContractMetadata({
                    chain: '0x1',
                    address
                });

                const { name, symbol } = response.raw;

                if (name === '' || symbol === '') return {
                    error: ErrorType.BadRequest,
                    message: 'Provided address is not an NFT or cannot be tracked.',
                    statusCode: ErrorStatusCode.BadRequest
                };

                await this.projectModel.create({
                    owner,
                    address,
                    type,
                    bookmarked
                });

                return null;
            }
        } else return null;
    }

    async get(owner: `0x${string}`, type: 'token' | 'nft') {
        const tokens = await this.projectModel.find({
            owner: { $regex: new RegExp(owner, 'i') },
            type
        });

        if (type === 'token') {
            const pricesResponse = await Moralis.EvmApi.token.getMultipleTokenPrices({
                chain: '0x1',
            }, {
                tokens: tokens.map(({ address }) => ({
                    tokenAddress: address,
                }))
            });

            const pricesAndMetadata = pricesResponse.raw;

            return pricesAndMetadata.map((token: any, index: number) => {
                const { tokenName, tokenSymbol, tokenLogo, usdPrice } = token;

                return {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    price: usdPrice,
                    bookmarked: tokens[index].bookmarked,
                };
            })
                .sort((a, b) => {
                    if (a.bookmarked && !b.bookmarked) return -1;
                    if (!a.bookmarked && b.bookmarked) return 1;
                    return 0;
                });
        } else if (type === 'nft') {
            const metadata = await Promise.all(tokens.map(async ({ address }) => {
                const response = await Moralis.EvmApi.nft.getNFTContractMetadata({
                    chain: '0x1',
                    address
                });

                const { name, symbol, collection_logo: logo } = response.raw;

                return {
                    name,
                    symbol,
                    logo
                };
            }));

            const prices = await Promise.all(tokens.map(async ({ address }) => {
                const response = await Moralis.EvmApi.nft.getNFTContractSalePrices({
                    chain: '0x1',
                    address
                });

                const { average_sale, lowest_sale } = response.raw;
                const { current_usd_value: avgPrice } = average_sale;
                const { current_usd_value: floorPrice } = lowest_sale;

                return {
                    avgPrice,
                    floorPrice
                };
            }));

            return metadata.map((nft, index) => ({
                ...nft,
                avgPrice: prices[index].avgPrice,
                floorPrice: prices[index].floorPrice,
                bookmarked: tokens[index].bookmarked
            }))
                .sort((a, b) => {
                    if (a.bookmarked && !b.bookmarked) return -1;
                    if (!a.bookmarked && b.bookmarked) return 1;
                    return 0;
                });
        }
    }
}
