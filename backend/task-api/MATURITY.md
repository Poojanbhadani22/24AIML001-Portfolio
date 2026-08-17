# Richardson Maturity Model Evaluation

## API

Task Management REST API using Node.js and Express.js

---

## Evaluation Table

| Level | Criterion | Satisfied | Evidence |
|------|-----------|-----------|----------|
| Level 0 | Single endpoint | No | Separate endpoints are used. |
| Level 1 | Resources identified by URIs | Yes | /tasks and /tasks/:id |
| Level 2 | Correct HTTP methods and status codes | Yes | GET, POST, PUT, DELETE with 200, 201, 400, 404 and 500 status codes |
| Level 3 | HATEOAS | No | Hypermedia links are not implemented |

---

## Evaluation

### Level 0
The API does not use a single endpoint for every request. It uses different endpoints for different resources.

### Level 1
The API identifies resources using URIs.

Examples:
- GET /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

### Level 2
The API correctly uses:
- GET
- POST
- PUT
- DELETE

It also returns proper HTTP status codes:
- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

Therefore, the API satisfies Level 2.

### Level 3
The API does not implement HATEOAS, so it does not satisfy Level 3.

---

## HATEOAS Example

```json
{
  "id": 3,
  "title": "Complete Practical",
  "completed": true,
  "_links": {
    "self": "/tasks/3",
    "update": "/tasks/3",
    "delete": "/tasks/3",
    "allTasks": "/tasks"
  }
}
```

---

## Why Most Production APIs Stop at Level 2

Most production APIs stop at Level 2 because using proper resource URLs, HTTP methods, and status codes provides a clean, scalable, and widely supported API. HATEOAS increases complexity and is not required for most client applications.

---

## Conclusion

The Task Management API satisfies Richardson Maturity Model Level 2 because it correctly uses resource-based URLs, HTTP methods, and HTTP status codes. HATEOAS is not implemented, so it does not reach Level 3.