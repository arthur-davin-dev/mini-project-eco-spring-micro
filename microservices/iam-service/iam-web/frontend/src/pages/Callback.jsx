import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountLoadingSkeleton from '../components/profile/AccountLoadingSkeleton';

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/account/profile', { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [navigate]);

    return <AccountLoadingSkeleton label="Completing sign in..." />;
}
