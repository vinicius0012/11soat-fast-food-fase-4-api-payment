import { Logger } from '@nestjs/common';
import axios from 'axios';
import { AppError } from 'src/application/domain/errors/app.error';

/**
 * Função utilitária para tratamento padronizado de erros nos serviços
 * @param error O erro capturado
 * @param context Identificador do contexto onde o erro ocorreu (para logging)
 * @returns nunca retorna, sempre lança uma exceção
 */
export function handleServiceError(error: unknown, context: string): never {
  const logger = new Logger(context);

  if (error instanceof AppError) {
    logger.error(`${error.errorType}: ${error.message}`);
    throw error;
  }

  if (error instanceof Error) {
    logger.error(`Error in ${context}: ${error.message}`, error.stack);
    throw AppError.internal({
      message: error.message,
      details: error.stack,
    });
  }

  logger.error(`Unknown error in ${context}`, error);
  throw AppError.internal({
    message: 'An unexpected error occurred',
    details: error,
  });
}

export const handleErrorDescription = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ??
      'An unexpected error occurred'
    );
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
