This is a framework for creating builder rabbitMQ services.
Tests will be written initially only at the next composition level (an actual builder)

That is done to speed up development.

# docker run rabbitmq
`docker run -d --hostname my-rabbit --name my-rabbit -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 15672:15672 -p 25672:25672 rabbitmq:3-management`
