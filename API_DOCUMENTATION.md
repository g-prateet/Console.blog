# REST API Documentation

Base URL: `http://localhost:5000/api`

---

## Create a Post
**Endpoint:** `POST /posts`  
**Description:** Creates a new blog post.

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my first post...",
  "published": true
}
```

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Post",
  "content": "This is the content of my first post...",
  "published": true,
  "created_at": "2023-10-27T10:00:00Z"
}
```

---

## Retrieve All Posts
**Endpoint:** `GET /posts`  
**Description:** Fetches all blog posts, ordered by creation date descending.

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Post",
    "content": "This is the content of my first post...",
    "published": true,
    "created_at": "2023-10-27T10:00:00Z"
  }
]
```

---

## Retrieve a Specific Post
**Endpoint:** `GET /posts/:id`  
**Description:** Fetches a single post by its UUID.

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Post",
  "content": "This is the content of my first post...",
  "published": true,
  "created_at": "2023-10-27T10:00:00Z"
}
```

**Error Response:**
- **Code:** 404 Not Found
- **Content:** `{ "error": "Post not found" }`

---

## Update a Post
**Endpoint:** `PUT /posts/:id`  
**Description:** Updates an existing post's title, content, or published status.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "published": false
}
```

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "content": "Updated content...",
  "published": false,
  "created_at": "2023-10-27T10:00:00Z"
}
```

---

## Delete a Post
**Endpoint:** `DELETE /posts/:id`  
**Description:** Deletes a specific post by its UUID.

**Success Response:**
- **Code:** 200 OK
- **Content:** `{ "message": "Post deleted successfully" }`
