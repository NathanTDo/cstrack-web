import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import LandingPage from "@/components/LandingPage";

Amplify.configure(awsExports);

const Home = () => {
  return (
    <>
      <LandingPage />
    </>
  );
};

export default Home;
