import React from "react";
import ReusablePriorityPage from "../../../components/ReusablePriorityPage";
import { Priority } from "../../../constants/priority";

const Backlog = () => {
  return <ReusablePriorityPage priority={Priority.Backlog} />;
};

export default Backlog;
