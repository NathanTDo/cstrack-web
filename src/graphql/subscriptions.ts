/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateSkin = /* GraphQL */ `subscription OnCreateSkin(
  $filter: ModelSubscriptionSkinFilterInput
  $owner: String
) {
  onCreateSkin(filter: $filter, owner: $owner) {
    id
    owner
    market_hash_name
    buyPrice
    quantity
    wear
    statTrak
    iconUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateSkinSubscriptionVariables,
  APITypes.OnCreateSkinSubscription
>;
export const onUpdateSkin = /* GraphQL */ `subscription OnUpdateSkin(
  $filter: ModelSubscriptionSkinFilterInput
  $owner: String
) {
  onUpdateSkin(filter: $filter, owner: $owner) {
    id
    owner
    market_hash_name
    buyPrice
    quantity
    wear
    statTrak
    iconUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateSkinSubscriptionVariables,
  APITypes.OnUpdateSkinSubscription
>;
export const onDeleteSkin = /* GraphQL */ `subscription OnDeleteSkin(
  $filter: ModelSubscriptionSkinFilterInput
  $owner: String
) {
  onDeleteSkin(filter: $filter, owner: $owner) {
    id
    owner
    market_hash_name
    buyPrice
    quantity
    wear
    statTrak
    iconUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteSkinSubscriptionVariables,
  APITypes.OnDeleteSkinSubscription
>;
