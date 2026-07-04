import pandas as pd

data = []

# Month names
months = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

# Hours from 9 AM to 5 PM
hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]

for month_num in range(1, 13):
    month_name = months[month_num]

    # Days in month
    if month_num == 2:
        days = 28
    elif month_num in [4, 6, 9, 11]:
        days = 30
    else:
        days = 31

    for day in range(1, days + 1):

        for hour in hours:

            # ================= LIBRARY =================
            if month_num in [1, 2, 6, 7, 8, 9]:
                if hour in [11, 12]:
                    library = "Medium"
                else:
                    library = "Low"

            elif month_num in [3, 4, 10, 11]:
                if hour in [10, 11, 12]:
                    library = "High"
                else:
                    library = "Medium"

            else:  # May and December
                library = "High"

            data.append([
                month_name,
                "Library",
                hour,
                day,
                library
            ])

            # ================= CAFETERIA =================
            if month_num in [6, 7]:
                cafeteria = "Low"

            else:
                if hour in [12, 13, 14]:
                    cafeteria = "High"
                elif hour in [10, 11, 15]:
                    cafeteria = "Medium"
                else:
                    cafeteria = "Low"

            data.append([
                month_name,
                "Cafeteria",
                hour,
                day,
                cafeteria
            ])

            # ================= LAB =================
            if month_num in [6, 7]:
                lab = "High"
            else:
                if hour in [9, 10, 11, 12, 13]:
                    lab = "Medium"
                else:
                    lab = "Low"

            data.append([
                month_name,
                "Lab",
                hour,
                day,
                lab
            ])

            # ================= FEE COUNTER =================
            if month_num in [3, 6, 7]:
                fee_counter = "Low"

            elif month_num in [2, 5, 9, 10, 12]:
                fee_counter = "Medium"

            elif month_num in [1, 4, 8, 11]:
                fee_counter = "High"

            data.append([
                month_name,
                "Fee Counter",
                hour,
                day,
                fee_counter
            ])

            # ================= BANK =================
            if month_num in [3, 6, 7]:
                bank = "Low"

            elif month_num in [2, 5, 9, 10, 12]:
                bank = "Medium"

            elif month_num in [1, 4, 8, 11]:
                bank = "High"

            data.append([
                month_name,
                "Bank",
                hour,
                day,
                bank
            ])

            # ================= ADMISSION CELL =================
            if month_num in [6, 7]:

                if hour in [9, 17]:
                    admission = "Low"
                else:
                    admission = "High"

            elif month_num in [5, 8, 9]:
                admission = "Medium"

            else:  # Jan, Feb, Mar, Apr, Oct, Nov, Dec
                admission = "Low"

            data.append([
                month_name,
                "Admission Cell",
                hour,
                day,
                admission
            ])

# Create DataFrame
df = pd.DataFrame(
    data,
    columns=["Month", "Place", "Hour", "Day", "Crowd_level"]
)

# Save dataset
df.to_csv("campus_navigation_dataset.csv", index=False)

print("Dataset created successfully!")
print("Total rows:", len(df))
print(df.head(30))