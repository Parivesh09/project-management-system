import React from "react";
import ReusablePriorityPage from "../../../components/ReusablePriorityPage";
import { Priority } from "../../../constants/priority";

const Urgent = () => {
  return <ReusablePriorityPage priority={Priority.Urgent} />;
};

export default Urgent;
