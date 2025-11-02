"use client";

import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports, { ssr: true });

export default function ConfigureAmplifyClientSide() {
  return null;
}
