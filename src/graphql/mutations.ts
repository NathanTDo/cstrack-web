/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createSkin = /* GraphQL */ `mutation CreateSkin(
  $input: CreateSkinInput!
  $condition: ModelSkinConditionInput
) {
  createSkin(input: $input, condition: $condition) {
    id
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
` as GeneratedMutation<
  APITypes.CreateSkinMutationVariables,
  APITypes.CreateSkinMutation
>;
export const updateSkin = /* GraphQL */ `mutation UpdateSkin(
  $input: UpdateSkinInput!
  $condition: ModelSkinConditionInput
) {
  updateSkin(input: $input, condition: $condition) {
    id
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
` as GeneratedMutation<
  APITypes.UpdateSkinMutationVariables,
  APITypes.UpdateSkinMutation
>;
export const deleteSkin = /* GraphQL */ `mutation DeleteSkin(
  $input: DeleteSkinInput!
  $condition: ModelSkinConditionInput
) {
  deleteSkin(input: $input, condition: $condition) {
    id
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
` as GeneratedMutation<
  APITypes.DeleteSkinMutationVariables,
  APITypes.DeleteSkinMutation
>;
