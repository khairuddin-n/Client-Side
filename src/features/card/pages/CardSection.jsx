import { Navigate, useLocation } from 'react-router-dom';

export default function CardSection() {
  const { state } = useLocation();
  const account = state?.card?.account_number;
  return (
    <Navigate
      to={
        account
          ? '/detailmycard?account=' + encodeURIComponent(account)
          : '/detailmycard'
      }
      replace
    />
  );
}
