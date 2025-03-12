import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";

const categories = [
    "chochox",
   "scout69",
   "comxxx",
    "lesbify",
    "milfnut",
    "badwap",
    "sex sister",
    "sex18",
    "desi49",
    "dehati sex",
    "boobs pressing",
    "blueflim",
    "aunt sex",
    "famili sex com",
    "teen sex",
    "small tits",
    "fullporner",
];

const Slider = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(false); // No default active tab

    // Extract category from URL (ignoring page number)
    useEffect(() => {
        const pathParts = location.pathname.split("/category/")[1]?.split("/") || [];
        const pathCategory = pathParts[0]; // Extract category (ignore pagination)
        const index = categories.findIndex(cat => cat.toLowerCase().replace(/\s+/g, "-") === pathCategory);
        setActiveTab(index !== -1 ? index : false);
    }, [location.pathname]); // Runs whenever the URL changes

    const handleChange = (event, newValue) => {
        const selectedCategory = categories[newValue];
        navigate(`/category/${selectedCategory.toLowerCase().replace(/\s+/g, "-")}/1`); // Always go to page 1
    };

    return (
        <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="secondary"
            textColor="primary"
            sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#212121', // Custom color for indicator
                },
                '& .MuiTab-root': {
                  color: '#616161', // Custom text color for all tabs
                },
                '& .MuiTab-root.Mui-selected': {
                  color: '#212121', // Custom color for the selected tab
                },
              }}
        >
            {categories.map((category, index) => (
                <Tab key={index} label={category} />
            ))}
        </Tabs>
    );
};

export default Slider;
