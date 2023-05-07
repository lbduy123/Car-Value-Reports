import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieSession({
    keys: ['cookie-secret']
  }))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // don't allow user to add unexpected properties, its security
    })
  )
  await app.listen(3000);
}
bootstrap();
