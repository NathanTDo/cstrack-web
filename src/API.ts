/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateSkinInput = {
  id?: string | null,
  owner?: string | null,
  market_hash_name: string,
  quantity: number,
  wear?: string | null,
  statTrak?: boolean | null,
  iconUrl?: string | null,
};

export type ModelSkinConditionInput = {
  owner?: ModelStringInput | null,
  market_hash_name?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  wear?: ModelStringInput | null,
  statTrak?: ModelBooleanInput | null,
  iconUrl?: ModelStringInput | null,
  and?: Array< ModelSkinConditionInput | null > | null,
  or?: Array< ModelSkinConditionInput | null > | null,
  not?: ModelSkinConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Skin = {
  __typename: "Skin",
  id: string,
  owner?: string | null,
  market_hash_name: string,
  quantity: number,
  wear?: string | null,
  statTrak?: boolean | null,
  iconUrl?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateSkinInput = {
  id: string,
  owner?: string | null,
  market_hash_name?: string | null,
  quantity?: number | null,
  wear?: string | null,
  statTrak?: boolean | null,
  iconUrl?: string | null,
};

export type DeleteSkinInput = {
  id: string,
};

export type ModelSkinFilterInput = {
  id?: ModelIDInput | null,
  owner?: ModelStringInput | null,
  market_hash_name?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  wear?: ModelStringInput | null,
  statTrak?: ModelBooleanInput | null,
  iconUrl?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelSkinFilterInput | null > | null,
  or?: Array< ModelSkinFilterInput | null > | null,
  not?: ModelSkinFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelSkinConnection = {
  __typename: "ModelSkinConnection",
  items:  Array<Skin | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionSkinFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  market_hash_name?: ModelSubscriptionStringInput | null,
  quantity?: ModelSubscriptionIntInput | null,
  wear?: ModelSubscriptionStringInput | null,
  statTrak?: ModelSubscriptionBooleanInput | null,
  iconUrl?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionSkinFilterInput | null > | null,
  or?: Array< ModelSubscriptionSkinFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type CreateSkinMutationVariables = {
  input: CreateSkinInput,
  condition?: ModelSkinConditionInput | null,
};

export type CreateSkinMutation = {
  createSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateSkinMutationVariables = {
  input: UpdateSkinInput,
  condition?: ModelSkinConditionInput | null,
};

export type UpdateSkinMutation = {
  updateSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteSkinMutationVariables = {
  input: DeleteSkinInput,
  condition?: ModelSkinConditionInput | null,
};

export type DeleteSkinMutation = {
  deleteSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetSkinQueryVariables = {
  id: string,
};

export type GetSkinQuery = {
  getSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListSkinsQueryVariables = {
  filter?: ModelSkinFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSkinsQuery = {
  listSkins?:  {
    __typename: "ModelSkinConnection",
    items:  Array< {
      __typename: "Skin",
      id: string,
      owner?: string | null,
      market_hash_name: string,
      quantity: number,
      wear?: string | null,
      statTrak?: boolean | null,
      iconUrl?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateSkinSubscriptionVariables = {
  filter?: ModelSubscriptionSkinFilterInput | null,
  owner?: string | null,
};

export type OnCreateSkinSubscription = {
  onCreateSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateSkinSubscriptionVariables = {
  filter?: ModelSubscriptionSkinFilterInput | null,
  owner?: string | null,
};

export type OnUpdateSkinSubscription = {
  onUpdateSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteSkinSubscriptionVariables = {
  filter?: ModelSubscriptionSkinFilterInput | null,
  owner?: string | null,
};

export type OnDeleteSkinSubscription = {
  onDeleteSkin?:  {
    __typename: "Skin",
    id: string,
    owner?: string | null,
    market_hash_name: string,
    quantity: number,
    wear?: string | null,
    statTrak?: boolean | null,
    iconUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
