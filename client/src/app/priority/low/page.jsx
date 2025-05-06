import React from "react";
import ReusablePriorityPage from "../../../components/ReusablePriorityPage";
import { Priority } from "../../../constants/priority";

const Low = () => {
  return <ReusablePriorityPage priority={Priority.Low} />;
};

export default Low;
