import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticatorController } from './authenticator/authenticator.controller';
import { AuthenticatorService } from './authenticator/authenticator.service';

import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { Project, ProjectSchema } from './schemas/project.schema';

import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';

import { AuthenticatorMiddleware } from './authenticator/authenticator.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule,
      ],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Project.name, schema: ProjectSchema }
    ]),
  ],
  controllers: [AppController, AuthenticatorController, ProjectsController],
  providers: [AppService, AuthenticatorService, ProjectsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticatorMiddleware)
      .forRoutes(ProjectsController);
  }
}
