import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*'
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Gestion comptabilité')
    .setDescription('API pour la gestion de la comptabilité')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    })
    .addTag('API comptabilité')
    .addServer('/')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  await app.listen(process.env.PORT as string);
  console.log(`✅ Server is running at http://localhost:${process.env.PORT}`);
  console.log(`📘 Swagger documentation available at http://localhost:${process.env.PORT as string}/api/docs`);
}
bootstrap();
