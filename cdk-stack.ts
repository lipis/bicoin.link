#!/usr/bin/env node
import "source-map-support/register";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53_targets from "@aws-cdk/aws-route53-targets";
import * as logs from "@aws-cdk/aws-logs";
import * as servicediscovery from "@aws-cdk/aws-servicediscovery";

const env = {
  account: process.env.AWS_ACCOUNT,
  region: "eu-central-1",
  domain: "bicoin.link",
};

export class CdkStackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "bicoin-vpc", { maxAzs: 3 });
    const cluster = new ecs.Cluster(this, "bicoin-cluster", {
      vpc,
    });
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "worker-service", {
      cluster: cluster,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("tzador/bicoin-worker:v8"),
        containerPort: 8080,
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: "bicoin",
          logRetention: logs.RetentionDays.TWO_MONTHS,
        }),
        environment: {
          REDIS_URL: "redis://:srw8jn2vsfmgyvmv6bpwnmscte79xkg1@superb-wysteria-ff8f76fb7c.redisgreen.net:11042/",
        },
      },
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
    });
  }
}

const app = new cdk.App();
new CdkStackStack(app, "bicoin-Stack", { env });
