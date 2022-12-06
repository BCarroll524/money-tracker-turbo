# How to make a recurring transaction

1. What is the interval

- monthly, weekly, bi weekly, yearly

2. What is the starting date

- add the date and then interval

# How do we add the recurring transaction

1. have a cron job (gh action) that runs every day and will check if there is a transaction that occurs today and then add it to the transaction table

# Recurring transaction table schema

```
{
  startDate,
  endDate?,
  interval,
  amount,
  name,
  label,
  category,
  source
}
```
