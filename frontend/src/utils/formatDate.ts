import dayjs from 'dayjs';

export const formatDate = (date: string) => {
  return dayjs(date).format('DD MMM YYYY');
};

export const formatDateTime = (date: string) => {
  return dayjs(date).format('DD MMM YYYY • HH:mm');
};
