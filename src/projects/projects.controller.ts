import { Body, Controller, Post } from '@nestjs/common';
import { Put } from '@nestjs/common';

import { ErrorType, ErrorStatusCode } from 'src/types/errors';

import { ProjectsService } from './projects.service';

import { IGetProjectsResponse } from 'src/types/project';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Put('')
    async track(@Body() body: {
        token: {
            address: `0x${string}`
        },
        type: 'nft' | 'token',
        address: `0x${string}`,
        bookmark?: boolean
    }) {
        const { token, type, address, bookmark: bookmarked } = body;

        if (type !== 'token' && type !== 'nft') return {
            error: ErrorType.BadRequest,
            message: 'Invalid type parameter.',
            statusCode: ErrorStatusCode.BadRequest
        };

        // address is verfiied in middleware

        if (bookmarked === undefined && typeof bookmarked !== 'boolean') return {
            error: ErrorType.BadRequest,
            message: 'Invalid bookmarked parameter.',
            statusCode: ErrorStatusCode.BadRequest
        };

        const error = await this.projectsService.track({
            owner: token.address,
            address,
            type,
            ...(bookmarked !== undefined && { bookmarked })
        });

        if (error !== null) return error;

        return {
            message: 'Project tracked.',
            statusCode: 200
        };
    }

    @Post('/get')
    async getProjects(
        @Body() body: {
            token: {
                address: `0x${string}`
            },
            type: 'nft' | 'token'
        }
    ): Promise<IGetProjectsResponse> {
        const projects = await this.projectsService.get(body.token.address, body.type);

        return {
            data: projects,
            message: 'Projects retrieved.',
            statusCode: 200
        };
    }
}
