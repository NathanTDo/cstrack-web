/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getSkin = /* GraphQL */ `query GetSkin($id: ID!) {
  getSkin(id: $id) {
    id
    image
    owner
    market_hash_name
    quantity
    wear
    statTrak
    iconUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetSkinQueryVariables, APITypes.GetSkinQuery>;
export const listSkins = /* GraphQL */ `query ListSkins(
  $filter: ModelSkinFilterInput
  $limit: Int
  $nextToken: String
) {
  listSkins(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      image
      owner
      market_hash_name
      quantity
      wear
      statTrak
      iconUrl
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListSkinsQueryVariables, APITypes.ListSkinsQuery>;
