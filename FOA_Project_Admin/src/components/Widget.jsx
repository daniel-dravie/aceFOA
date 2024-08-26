import React, { useState, useEffect, Component } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import "../styles/widget.css";
import { Link, useParams } from "react-router-dom";
import { db } from "../helpers/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const Widget = ({ title }) => {
  const [value, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const { adminID } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfYearTimestamp = Timestamp.fromDate(startOfYear);

      let totalCount = 0;
      let currentYearCount = 0;
      let totalRevenue = 0;
      let currentYearRevenue = 0;

      switch (title) {
        case "CUSTOMERS":
          const customersRef = collection(db, "customers");
          const customersSnapshot = await getDocs(customersRef);
          totalCount = customersSnapshot.size;

          const currentYearCustomersQuery = query(
            customersRef,
            where("createdAt", ">=", startOfYearTimestamp)
          );
          const currentYearCustomersSnapshot = await getDocs(
            currentYearCustomersQuery
          );
          currentYearCount = currentYearCustomersSnapshot.size;

          setValue(totalCount);
          break;

        case "TOTAL REVENUE":
          const ordersRef = collection(db, "orders");
          const ordersSnapshot = await getDocs(ordersRef);

          ordersSnapshot.forEach((doc) => {
            const data = doc.data();
            totalRevenue += data.totalPrice || 0;
            if (data.createdAt && data.createdAt.toDate() >= startOfYear) {
              currentYearRevenue += data.totalPrice || 0;
            }
          });

          setValue(totalRevenue);
          break;

        case "ORDERS":
          const allOrdersRef = collection(db, "orders");
          const allOrdersSnapshot = await getDocs(allOrdersRef);
          totalCount = allOrdersSnapshot.size;

          const currentYearOrdersQuery = query(
            allOrdersRef,
            where("createdAt", ">=", startOfYearTimestamp)
          );
          const currentYearOrdersSnapshot = await getDocs(
            currentYearOrdersQuery
          );
          currentYearCount = currentYearOrdersSnapshot.size;

          setValue(totalCount);
          break;

        default:
          break;
      }

      if (title === "TOTAL REVENUE") {
        const percentageIncrease =
          totalRevenue !== 0 ? (currentYearRevenue / totalRevenue) * 100 : 0;
        setPercentage(percentageIncrease.toFixed(2));
      } else {
        const percentageIncrease =
          totalCount !== 0 ? (currentYearCount / totalCount) * 100 : 0;
        setPercentage(percentageIncrease.toFixed(2));
      }
    };

    fetchData();
  }, [title]);

  let data;
  switch (title) {
    case "CUSTOMERS":
      data = {
        icon: <PersonOutlinedIcon />,
        bgColor: "#e3f2fd",
        to: `/dashboard/${adminID}/customers`,
      };
      break;
    case "TOTAL REVENUE":
      data = {
        icon: <MonetizationOnOutlinedIcon />,
        bgColor: "#e8f5e9",
        to: "revenue",
        link: "View Revenue Details",
        
      };
      break;
    case "ORDERS":
      data = {
        icon: <ShoppingCartOutlinedIcon />,
        bgColor: "#fff3e0",
        to: `/dashboard/${adminID}`,
      };
      break;
    default:
      data = {
        icon: <AccountBalanceWalletOutlinedIcon />,
        link: "See details",
        bgColor: "#f3e5f5",
      };
  }

  const iconStyle = {
    backgroundColor: data.bgColor,
    borderRadius: "10%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{title}</span>
        <span className="counter">
          {title === "TOTAL REVENUE" ? `GH₵ ${value.toFixed(2)}` : value}
        </span>
        <Link to={data.to} className="link">
          {data.link}
        </Link>
      </div>
      <div className="right">
        <div
          className={`percentage ${
            parseFloat(percentage) >= 0 ? "positive" : "negative"
          }`}
        >
          {parseFloat(percentage) >= 0 ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
          {Math.abs(parseFloat(percentage))} %
        </div>
        <div className="icon" style={iconStyle}>
          {data.icon}
        </div>
      </div>
    </div>
  );
};

export default Widget;