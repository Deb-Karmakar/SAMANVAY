import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getAgencyRecommendations = async (projectData) => {
  const { data } = await axiosInstance.post(
    '/agency-matching/recommendations',
    projectData
  );
  return data;
};

export default function AgencyRecommendation({ projectData, onSelectAgency }) {
  const [selectedAgency, setSelectedAgency] = useState(null);

  const recommendationMutation = useMutation({
    mutationFn: getAgencyRecommendations,
  });

  const handleGetRecommendations = () => {
    recommendationMutation.mutate(projectData);
  };

  const handleSelectAgency = (agency) => {
    setSelectedAgency(agency);
    if (onSelectAgency) {
      // Pass null as event since we already stopped propagation
      onSelectAgency(agency, null);
    }
  };

  const getConfidenceBadge = (score) => {
    if (score >= 90) return { variant: 'default', label: 'Excellent Match', color: 'text-green-600' };
    if (score >= 75) return { variant: 'secondary', label: 'Good Match', color: 'text-blue-600' };
    return { variant: 'outline', label: 'Fair Match', color: 'text-yellow-600' };
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Highly Recommended') return 'border-green-500 bg-green-50';
    if (recommendation === 'Recommended') return 'border-blue-500 bg-blue-50';
    return 'border-yellow-500 bg-yellow-50';
  };

  return (
    <div className="space-y-4">
      {/* Trigger Button */}
      {!recommendationMutation.data && !recommendationMutation.isPending && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Get AI-Powered Agency Recommendations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our intelligent system will analyze {projectData.name} and suggest the best agencies based on their track record and current capacity.
                </p>
              </div>
              <Button
                onClick={handleGetRecommendations}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get Smart Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {recommendationMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyzing Agencies...
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our AI is evaluating completion rates, workload, and historical performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {recommendationMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to generate recommendations. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Success State with Recommendations */}
      {recommendationMutation.isSuccess && recommendationMutation.data.success && (
        <div className="space-y-4">
          {/* AI Summary */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-gray-700">
              <strong>AI Analysis:</strong> {recommendationMutation.data.summary}
            </AlertDescription>
          </Alert>

          {/* Recommendations */}
          <div className="space-y-3">
            {recommendationMutation.data.aiRecommendations?.map((rec, index) => {
              const badge = getConfidenceBadge(rec.confidenceScore);
              const isSelected = selectedAgency?.agencyName === rec.agencyName;

              return (
                <Card
                  key={index}
                  className={cn(
                    'border-2 transition-all cursor-pointer hover:shadow-md',
                    isSelected ? 'border-blue-600 bg-blue-50' : getRecommendationColor(rec.recommendation)
                  )}
                  onClick={() => handleSelectAgency(rec)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white border-2 border-gray-200">
                          <Award className={cn('h-5 w-5', badge.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {index + 1}. {rec.agencyName}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {rec.recommendation}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={badge.variant} className="flex-shrink-0">
                        {badge.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Confidence Score */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">Match Score</span>
                        <span className={cn('font-bold', badge.color)}>
                          {rec.confidenceScore}%
                        </span>
                      </div>
                      <Progress value={rec.confidenceScore} className="h-2" />
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <strong>Why this agency:</strong> {rec.reasoning}
                      </p>
                    </div>

                    {/* Strengths */}
                    {rec.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          ✅ Strengths:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.strengths.map((strength, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-300"
                            >
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Concerns */}
                    {rec.concerns?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          ⚠️ Concerns:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.concerns.map((concern, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                            >
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best For */}
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <p className="text-xs text-blue-900">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        <strong>Best for:</strong> {rec.bestFor}
                      </p>
                    </div>

                    {/* Selection Button */}
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectAgency(rec);
                      }}
                      className={cn(
                        'w-full',
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      )}
                      size="sm"
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Selected
                        </>
                      ) : (
                        'Select This Agency'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 text-center">
            Analyzed {recommendationMutation.data.metadata?.totalAgenciesAnalyzed} agencies •{' '}
            {recommendationMutation.data.metadata?.qualifiedAgencies} qualified •{' '}
            AI analyzed top {recommendationMutation.data.metadata?.aiAnalyzed}
          </div>
        </div>
      )}

      {/* No Agencies Found */}
      {recommendationMutation.isSuccess && !recommendationMutation.data.success && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {recommendationMutation.data.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}