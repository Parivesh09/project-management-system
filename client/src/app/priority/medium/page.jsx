import React from "react";
import ReusablePriorityPage from "../../../components/ReusablePriorityPage";
import { Priority } from "../../../constants/priority";

const Medium = () => {
  return <ReusablePriorityPage priority={Priority.Medium} />;
};

export default Medium;
