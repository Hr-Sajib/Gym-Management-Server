import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TErrorSources, TGenericErrorResponse } from "./interface/error";

const handlePrismaClientError = (
  err: PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let message = 'Database error';
  let statusCode = 500;
  const errorSources: TErrorSources = [];

  switch (err.code) {
    case 'P2002':
      message = 'Duplicate entry';
      statusCode = 409;
      errorSources.push({
        path: (err.meta?.target as string[])?.join(', ') || 'unknown',
        message: 'Value already exists',
      });
      break;

    case 'P2025':
      message = 'Record not found';
      statusCode = 404;
      errorSources.push({
        path: 'id',
        message: err.message,
      });
      break;

    default:
      errorSources.push({
        path: '',
        message: err.message,
      });
      break;
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaClientError;
