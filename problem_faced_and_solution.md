1. How to run migrations in adonis JS.
Sol: 
node ace migration:run. Migrations are TypeScript files in database/migrations/ that extend BaseSchema. You can write raw SQL inside using this.schema.raw().

2. How to run raw sql query in adonisJS.
Sol:
Use db.rawQuery() from @adonisjs/lucid/services/db. It returns { rows: [...] } with plain JavaScript objects


3. How to perform CRUD operations using RAW SQL query. 
Sol: 
Use db.rawQuery() with parameterized queries (? placeholders) for INSERT, UPDATE, DELETE, SELECT. PostgreSQLs RETURNING clause gives back the inserted/updated row.


4. How to map flat data from select query to object, nested objects.
Sol:
A single JOIN query returns flat rows with duplicate parent data. Used JoinJS library with resultMap definitions to convert flat rows into nested Quiz -> Questions -> Options structure.

We follow similar way to map data in spring boot  -> by using mybatis


5. CORS issues dusing testing
Sol: 
Frontend on port 5173, backend on 3333. AdonisJS CORS config set origin: true in dev mode to allow all origins.

6. Other small issues faced like user list in multiplayer / syntax related / project architecture, These were resolved during run time.