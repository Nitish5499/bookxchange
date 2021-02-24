import csv, redis, json
import sys

REDIS_HOST = 'localhost'

def read_csv_data(csv_file, index):
    with open(csv_file, encoding='utf-8') as csv_file:
        csv_data = csv.reader(csv_file)
        return [(r[index], 1) for r in csv_data]

def store_data(conn, data):
    for i in data:
        conn.setnx(i[0], i[1]) # `i[1]` here will be `1`
    return data

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: %s file.csv [key_column_index, value_column_index]" % __file__)
    
    column = 0 if len(sys.argv) < 3 else int(sys.argv[2])
    
    data = read_csv_data(sys.argv[1], column)

    # to remove the name of the columns
    del data[0]
    
    conn = redis.Redis(REDIS_HOST)
    store_data(conn, data)
if '__main__' == __name__:
    main()
