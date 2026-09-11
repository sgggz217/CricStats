import mysql.connector

try:
    mydb = mysql.connector.connect(
      host="localhost",
      user="root",
      password="Sonu@1702"
    )

    mycursor = mydb.cursor()
    
    # User specified database name as 'db'
    mycursor.execute("CREATE DATABASE IF NOT EXISTS db")
    print("Database created successfully or already exists.")
except mysql.connector.Error as err:
    print(f"Error: {err}")
