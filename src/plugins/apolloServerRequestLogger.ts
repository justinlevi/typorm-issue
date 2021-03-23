import { gql } from 'apollo-server-express';
import { getOperationAST, OperationDefinitionNode } from 'graphql';
import { GraphQLRequestContext } from "apollo-server-types";

// https://spectrum.chat/apollo/apollo-server/how-to-detect-introspection-query~432197c6-549a-467d-bdca-9083a98406aa
function isIntrospectionQuery(operation: OperationDefinitionNode) {
  return operation && operation.selectionSet && operation.selectionSet.selections.every(selection => {
    const fieldName = (selection as any).name.value as string; // e.g., `someField` or `__schema`
    return fieldName.startsWith('__');
  });
}

export const apolloServerRequestLoggerPlugin = {

  // Fires whenever a GraphQL request is received from a client.
  requestDidStart(requestContext: GraphQLRequestContext) {

    const document = requestContext.request.query && gql(requestContext.request.query);
    const operation = document && getOperationAST(document);
    const isIntrospection = isIntrospectionQuery(
      operation as OperationDefinitionNode,
    );

    if (!isIntrospection){
      console.log('Request started! Query:\n' + requestContext.request.query);
    }

    /*
    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      parsingDidStart(requestContext: GraphQLRequestContext) {
        console.log('Parsing started!');
      },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      validationDidStart(requestContext: GraphQLRequestContext) {
        console.log('Validation started!');
      },

    }
    */
  },
};


export default apolloServerRequestLoggerPlugin;