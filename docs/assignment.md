## JavaScript Assignment: CSV Data Explorer

### Objective

Build a **pure JavaScript web application** that loads a large CSV file (1000+ records), converts it into JSON, and displays it in an interactive UI with advanced data operations.

This assignment evaluates:

* JavaScript fundamentals
* Array & Object methods
* Data transformation
* DOM manipulation
* Event handling
* Code organization

---

## Project Overview

You will be provided with a **CSV file containing over 1000 records**.
The application should:

1. Parse the CSV file into JSON
2. Display the data in a tabular UI
3. Allow users to interact with the data through pagination, sorting, filtering, and additional features

---

## Functional Requirements

### 1. CSV Parsing

* Accept a CSV file (preloaded or via file upload)
* Convert CSV data into an array of JavaScript objects
* Handle:

  * Header row
  * Empty values
  * Numeric vs string data
* External libraries are **not allowed**

---

### 2. Data Display

* Render data in an HTML table
* Generate table headers dynamically
* Show loading indicator during parsing

---

### 3. Pagination

* Default page size: 10 or 20 records
* Controls:

  * Next / Previous
  * Page number
  * Page size selector (10 / 20 / 50)
* Pagination must work after filtering & sorting

---

### 4. Sorting

* Clickable column headers
* Toggle ascending / descending
* Support numeric and string sorting
* Show visual indicator (↑ ↓)

---

### 5. Filtering

* Global search across all columns
* Case-insensitive, partial matching
* Works with pagination & sorting

---

## Additional Features (Implement at Least 4)

1. Column visibility toggle
2. Row selection with bulk delete
3. Record detail view (modal / side panel)
4. Add new record form with validation
5. Export filtered/selected data (CSV or JSON)
6. Summary statistics (counts, averages)
7. Persist UI state using `localStorage`
8. Error handling for invalid CSV
9. Reset filters & sorting
10. Highlight searched text in results

---

## Technical Constraints

* Vanilla JavaScript (ES6+)
* No frameworks or libraries
* HTML + CSS only
* Clean, modular, readable code