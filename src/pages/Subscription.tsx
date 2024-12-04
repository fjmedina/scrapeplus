import React from 'react';
import { Check, Loader } from 'lucide-react';
import { useSubscriptionStore, SUBSCRIPTION_PLANS, type SubscriptionTier } from '../store/subscriptionStore';

export function Subscription() {
  const { currentPlan, loading, upgradeSubscription } = useSubscriptionStore();
  const [upgrading, setUpgrading] = React.useState<SubscriptionTier | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      setUpgrading(tier);
      await upgradeSubscription(tier);
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
              currentPlan.tier === plan.tier
                ? 'border-2 border-indigo-500'
                : 'border border-gray-200'
            }`}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-500">
                {plan.tier === 'enterprise' ? 'Custom pricing' : `$${plan.price}/month`}
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="ml-3 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pt-6 pb-8">
              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={currentPlan.tier === plan.tier || upgrading !== null}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  currentPlan.tier === plan.tier
                    ? 'bg-indigo-50 text-indigo-700 cursor-default'
                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {upgrading === plan.tier ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : currentPlan.tier === plan.tier ? (
                  'Current Plan'
                ) : (
                  'Upgrade'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}