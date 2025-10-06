// Frontend/src/components/alerts/AlertBadge.jsx
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function AlertBadge({ severity }) {
    const config = {
        critical: {
            icon: AlertTriangle,
            variant: 'destructive',
            label: 'Critical'
        },
        warning: {
            icon: AlertCircle,
            variant: 'default',
            label: 'Warning'
        },
        info: {
            icon: Info,
            variant: 'secondary',
            label: 'Info'
        }
    };

    const { icon: Icon, variant, label } = config[severity] || config.info;

    return (
        <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}