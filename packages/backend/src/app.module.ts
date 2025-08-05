import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    AuthModule,
    FilesModule,
  ],
})
export class AppModule {} 