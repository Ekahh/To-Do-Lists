const amqp = require("amqplib");

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      TODO_CREATED: "todo.created",
      TODO_UPDATED: "todo.updated",
      TODO_DELETED: "todo.deleted",
      TODO_COMPLETED: "todo.completed",
    };
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) return;

      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost"
      );
      this.channel = await this.connection.createChannel();

      // Declare queues
      for (const queueName of Object.values(this.queues)) {
        await this.channel.assertQueue(queueName, { durable: true });
      }

      this.isConnected = true;
      console.log("RabbitMQ connected successfully");
    } catch (error) {
      console.error("RabbitMQ connection error:", error);
      this.isConnected = false;
      // Don't throw error to prevent app from crashing
    }
  }

  async publishMessage(queueName, message) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.channel) {
        console.log("RabbitMQ not available, skipping message publish");
        return;
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      await this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true,
      });
      console.log(`Message published to queue: ${queueName}`);
    } catch (error) {
      console.error("Error publishing message:", error);
      // Don't throw error to prevent app from crashing
    }
  }

  async consumeMessages(queueName, callback) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.channel) {
        console.log("RabbitMQ not available, skipping message consumption");
        return;
      }

      await this.channel.consume(queueName, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel.ack(msg);
        }
      });

      console.log(`Started consuming messages from queue: ${queueName}`);
    } catch (error) {
      console.error("Error consuming messages:", error);
      // Don't throw error to prevent app from crashing
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }
}

module.exports = new RabbitMQService();
