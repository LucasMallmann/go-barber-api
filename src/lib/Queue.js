import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    /**
     * All tasks inside queues are called jobs
     */
    jobs.forEach(job => {
      const { key, handle } = job;
      /**
       * Store the queue that has connection to Redis. Store also the handle, that is going to process the job
       */
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  /**
   * Add a new job to the queue
   * @param {string} key Unique key of the job
   * @param {any} job Data that it's going to pass to the handle function
   */
  add(key, job) {
    return this.queues[key].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
