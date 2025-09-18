import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    currentAmount: number;
    targetAmount: number;
    contributorCount: number;
    isCompleted?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const progressPercentage = (product.currentAmount / product.targetAmount) * 100;
  const remainingAmount = product.targetAmount - product.currentAmount;

  return (
    <Card className="card-hover border-border shadow-sm" data-testid={`card-product-${product.id}`}>
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-48 object-cover rounded-t-lg"
        data-testid={`img-product-${product.id}`}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="text-right">
            <p className="text-lg font-bold text-secondary" data-testid={`text-product-price-${product.id}`}>
              ${product.price}
            </p>
            {product.isCompleted && (
              <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                FULLY FUNDED
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        {/* Group gift progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {product.isCompleted ? "Group Gift Complete!" : "Group Gift Progress"}
            </span>
            <span className="text-primary font-semibold" data-testid={`text-progress-${product.id}`}>
              ${product.currentAmount} of ${product.targetAmount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${product.isCompleted ? 'bg-primary' : 'progress-bar'}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              data-testid={`progress-bar-${product.id}`}
            />
          </div>
          <p className="text-xs text-muted-foreground" data-testid={`text-contributors-${product.id}`}>
            {product.isCompleted 
              ? "✓ Gift purchased and on the way!"
              : `${product.contributorCount} contributors • $${remainingAmount} remaining`
            }
          </p>
        </div>
        
        <Button 
          className="w-full"
          disabled={product.isCompleted}
          data-testid={`button-contribute-${product.id}`}
        >
          {product.isCompleted 
            ? "Gift Complete"
            : `Contribute $${Math.min(25, remainingAmount)}`
          }
        </Button>
      </CardContent>
    </Card>
  );
}
