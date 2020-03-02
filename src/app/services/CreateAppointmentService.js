import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      throw new Error('You can only create appointments with providers');
    }

    if (user_id === provider_id) {
      throw new Error('You cannot schedule an appointment with yourself');
    }

    /**
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are not allowed');
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not available');
    }

    /**
     * Notify Appointment Provider
     */
    const user = await User.findByPk(user_id);
    /**
     * Format date. Eg: para dia 22 de Junho às 8:40h
     */
    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formatedDate}`,
      user: provider_id,
    });

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /**
     * Invalidate Cache
     */
    await Cache.invalidatePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
