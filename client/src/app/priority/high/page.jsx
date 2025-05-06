import React from "react";
import ReusablePriorityPage from "../../../components/ReusablePriorityPage";
import { Priority } from "../../../constants/priority";

const High = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default High;
