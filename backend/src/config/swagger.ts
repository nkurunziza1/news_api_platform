const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'News Platform API',
    version: '1.0.0',
    description: 'RESTful API for a  news platform',
  },
  servers: [{ url: '/api', description: 'API server (current host)' }],
  tags: [
    { name: 'Auth', description: 'Authentication APIs' },
    { name: 'News', description: 'News (posts) APIs' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'author', 'admin'] },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          status: { type: 'string', enum: ['draft', 'published'] },
          publishedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          post: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          body: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LikeStatus: {
        type: 'object',
        properties: {
          likesCount: { type: 'integer' },
          hasLiked: { type: 'boolean', description: 'Present when authenticated' },
        },
      },
      LikeToggle: {
        type: 'object',
        properties: {
          liked: { type: 'boolean' },
          likesCount: { type: 'integer' },
        },
      },
    },
  },
  paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User created' }, 409: { description: 'Email already registered' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: { email: { type: 'string' }, password: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Returns token and user' }, 401: { description: 'Invalid credentials' } },
        },
      },
      '/posts': {
        get: {
          tags: ['News'],
          summary: 'List posts',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published'] } },
            { name: 'author', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Paginated list of posts' } },
        },
        post: {
          tags: ['News'],
          summary: 'Create a post (news)',
          description: 'Send as multipart/form-data. If an image file is included, it is uploaded to Cloudinary and the returned URL is stored in the post. No separate upload endpoint.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description'],
                  properties: {
                    title: { type: 'string', description: 'Post title' },
                    description: { type: 'string', description: 'Post description' },
                    image: { type: 'string', format: 'binary', description: 'Optional image file; uploaded to Cloudinary, URL saved in post' },
                    status: { type: 'string', enum: ['draft', 'published'], description: 'Defaults to draft' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Post created' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/posts/slug/{slug}': {
        get: {
          tags: ['News'],
          summary: 'Get post by slug (public)',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Post' }, 404: { description: 'Not found' } },
        },
      },
      '/posts/{id}': {
        get: {
          tags: ['News'],
          summary: 'Get post by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Post' }, 404: { description: 'Not found' } },
        },
        patch: {
          tags: ['News'],
          summary: 'Update post',
          description: 'Send as multipart/form-data. Optional image file is uploaded to Cloudinary and the URL is stored in the post.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string', format: 'binary', description: 'Optional image file; uploaded to Cloudinary' },
                    status: { type: 'string', enum: ['draft', 'published'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Post updated' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['News'],
          summary: 'Delete post',
          security: [{ bearerAuth: [] }],
          responses: { 204: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
        },
      },
      '/posts/{id}/like': {
        get: {
          tags: ['News'],
          summary: 'Get like status',
          description: 'Returns likes count and, when authenticated, whether the current user liked the post.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Post ID' }],
          responses: {
            200: {
              description: 'Like status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/LikeStatus' },
                    },
                  },
                },
              },
            },
            404: { description: 'Post not found' },
          },
        },
        post: {
          tags: ['News'],
          summary: 'Toggle like on post',
          description: 'Like or unlike the post. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Post ID' }],
          responses: {
            200: {
              description: 'Updated like state',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/LikeToggle' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            404: { description: 'Post not found' },
          },
        },
      },
      '/posts/{id}/comments': {
        get: {
          tags: ['News'],
          summary: 'List comments on post',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Post ID' },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            200: {
              description: 'Paginated list of comments',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                      pagination: { type: 'object', properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' } } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['News'],
          summary: 'Add comment',
          description: 'Add a comment to the post. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Post ID' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['body'],
                  properties: { body: { type: 'string', maxLength: 2000, description: 'Comment text' } },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Comment created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Comment' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            404: { description: 'Post not found' },
          },
        },
      },
      '/posts/{id}/comments/{commentId}': {
        delete: {
          tags: ['News'],
          summary: 'Delete own comment',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Post ID' },
            { name: 'commentId', in: 'path', required: true, schema: { type: 'string' }, description: 'Comment ID' },
          ],
          responses: { 204: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Comment not found' } },
        },
      },
  },
};

export const swaggerSpec = swaggerDefinition;
