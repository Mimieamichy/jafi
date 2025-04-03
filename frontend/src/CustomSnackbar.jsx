import { forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

const variantStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-600 text-white',
}

const variantIcons = {
  success: faCheckCircle,
  error: faExclamationCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
}

const CustomSnackbar = forwardRef(function CustomSnackbar({ message, variant }, ref) {
  const Icon = variantIcons[variant]

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 px-4 py-3 rounded-md shadow-md max-w-sm ${variantStyles[variant]}`}
    >
      {Icon && <FontAwesomeIcon icon={Icon} className="text-xl" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
})

export default CustomSnackbar
